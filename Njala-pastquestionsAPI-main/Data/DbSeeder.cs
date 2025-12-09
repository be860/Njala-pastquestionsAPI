using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using NjalaAPI.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NjalaAPI.Data
{
    public static class DbSeeder
    {
        public static async Task SeedSuperAdminAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

            // Seed roles if they don't exist
            var roles = new[] { "SuperAdmin", "Admin", "Student" };
            foreach (var role in roles)
            {
                var roleExist = await roleManager.RoleExistsAsync(role);
                if (!roleExist)
                {
                    await roleManager.CreateAsync(new IdentityRole<Guid>(role));
                }
            }

            // Seed SuperAdmin user
            var superAdmin = await userManager.FindByEmailAsync("superadmin@njala.edu");
            if (superAdmin == null)
            {
                var newSuperAdmin = new ApplicationUser
                {
                    UserName = "superadmin@njala.edu", // Can use Email as UserName
                    Email = "superadmin@njala.edu",
                    FullName = "Super Admin",
                    Role = "SuperAdmin"
                };

                var result = await userManager.CreateAsync(newSuperAdmin, "SuperSecurePassword123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newSuperAdmin, "SuperAdmin");
                }
            }
        }
    }
}
