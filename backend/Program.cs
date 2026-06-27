using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NjalaAPI.Data;
using NjalaAPI.Models;
using NjalaAPI.Services;
using Microsoft.Extensions.Options;
using NjalaAPI.Services.Interfaces;
using Resend;
using System.Text;

var builder = WebApplication.CreateBuilder(args);



// 1) Add DbContext using connection string from appsettings.Development.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2) Configure Identity to use Guid keys and register UserManager and RoleManager
builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.User.RequireUniqueEmail = true;
})


.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders(); // Required for 2FA and UserManager services

// 3) JWT Auth
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            // Only log if it's not a missing token (which is expected for anonymous endpoints)
            if (!string.IsNullOrEmpty(context.Request.Headers["Authorization"].ToString()))
            {
                Console.WriteLine($"JWT failed: {context.Exception.Message}");
            }
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            // Only log if it's not an anonymous endpoint
            if (!context.Request.Path.Value?.Contains("/api/auth/") == true)
            {
                Console.WriteLine("JWT challenge triggered");
            }
            return Task.CompletedTask;
        }
    };
});

// Register core services
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<GroqService>();
builder.Services.AddScoped<DocumentTextExtractor>();

var resendApiKey = builder.Configuration["RESEND_API_KEY"];
var resendFromEmail = builder.Configuration["RESEND_FROM_EMAIL"];

Console.WriteLine($"RESEND_API_KEY configured: {!string.IsNullOrWhiteSpace(resendApiKey)}");
Console.WriteLine($"RESEND_FROM_EMAIL configured: {!string.IsNullOrWhiteSpace(resendFromEmail)}");

if (string.IsNullOrWhiteSpace(resendApiKey))
{
    throw new InvalidOperationException("RESEND_API_KEY is not configured. Set it in environment variables.");
}

if (string.IsNullOrWhiteSpace(resendFromEmail))
{
    throw new InvalidOperationException("RESEND_FROM_EMAIL is not configured. Set it in environment variables.");
}

builder.Services.AddHttpClient();
builder.Services.Configure<ResendClientOptions>(options =>
{
    options.ApiToken = resendApiKey;
});

builder.Services.AddScoped<ResendClient>(sp =>
{
    var options = sp.GetRequiredService<IOptionsSnapshot<ResendClientOptions>>();
    var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();

    return new ResendClient(
        options,
        httpClientFactory.CreateClient());
});

builder.Services.AddControllers();

// Authorization policies should already be configured here
builder.Services.AddAuthorization();

// Swagger/OpenAPI
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Njala Past Questions API by Benjamin Franklin", Version = "v1" });

    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        Description = "Enter your JWT token",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtSecurityScheme, Array.Empty<string>() }
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.WithOrigins(
            "https://njalapastquestions.site",
            "https://www.njalapastquestions.site",
            "http://localhost:3000"
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

// Seed roles and SuperAdmin - wrapped so DB failure doesn't crash the app
try
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var db = services.GetRequiredService<AppDbContext>();
        db.Database.Migrate();

        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        foreach (var roleName in new[] { "SuperAdmin", "Admin", "Student" })
        {
            if (!await roleManager.RoleExistsAsync(roleName))
                await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
        }

        string superAdminEmail = "superadmin@njala.edu";
        var superAdmin = await userManager.FindByEmailAsync(superAdminEmail);

        if (superAdmin == null)
        {
            var admin = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = superAdminEmail,
                Email = superAdminEmail,
                FullName = "Super Admin",
                Role = "SuperAdmin",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(admin, "SuperSecurePassword123!");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, "SuperAdmin");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[STARTUP ERROR] DB seeding failed: {ex.Message}");
    Console.WriteLine(ex.StackTrace);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware pipeline
app.UseSwagger();
app.UseSwaggerUI();
app.UseDefaultFiles();
app.UseStaticFiles();
//app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();