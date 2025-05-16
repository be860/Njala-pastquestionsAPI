using Microsoft.Extensions.Configuration;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

public class SmsService : ISmsService
{
    private readonly IConfiguration _config;

    public SmsService(IConfiguration config)
    {
        _config = config;

        var accountSid = _config["Twilio:AccountSid"];
        var authToken = _config["Twilio:AuthToken"];
        TwilioClient.Init(accountSid, authToken);
    }

    public async Task SendSmsAsync(string to, string message)
    {
        var fromPhone = new PhoneNumber(_config["Twilio:FromPhone"]);
        var toPhone = new PhoneNumber(to);

        await MessageResource.CreateAsync(
            body: message,
            from: fromPhone,
            to: toPhone
        );
    }
}
