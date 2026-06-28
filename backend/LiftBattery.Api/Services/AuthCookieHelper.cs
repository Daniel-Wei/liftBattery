using System.Net;
using LiftBattery.Api.Options;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Options;

namespace LiftBattery.Api.Services;

public sealed class AuthCookieHelper
{
    private readonly AuthOptions _options;

    public AuthCookieHelper(IOptions<AuthOptions> options)
    {
        _options = options.Value;
    }

    public string? ReadSessionToken(HttpRequestData request)
    {
        if (!request.Headers.TryGetValues("Cookie", out var cookieHeaders))
        {
            return null;
        }

        foreach (var cookieHeader in cookieHeaders)
        {
            var parts = cookieHeader.Split(';', StringSplitOptions.RemoveEmptyEntries);

            foreach (var part in parts)
            {
                var separator = part.IndexOf('=');

                if (separator <= 0)
                {
                    continue;
                }

                var name = part[..separator].Trim();
                var value = part[(separator + 1)..].Trim();

                if (string.Equals(name, _options.CookieName, StringComparison.Ordinal))
                {
                    return WebUtility.UrlDecode(value);
                }
            }
        }

        return null;
    }

    public void AppendSignInCookie(
        HttpResponseData response,
        string sessionToken,
        DateTimeOffset expiresAtUtc)
    {
        var cookie = BuildCookie(
            WebUtility.UrlEncode(sessionToken),
            $"Max-Age={(int)Math.Max(0, (expiresAtUtc - DateTimeOffset.UtcNow).TotalSeconds)}");
        response.Headers.Add("Set-Cookie", cookie);
    }

    public void AppendSignOutCookie(HttpResponseData response)
    {
        response.Headers.Add("Set-Cookie", BuildCookie(string.Empty, "Max-Age=0"));
    }

    private string BuildCookie(string value, string lifetimePart)
    {
        var securePart = _options.RequireSecureCookie ? "; Secure" : string.Empty;
        return $"{_options.CookieName}={value}; Path=/; HttpOnly; SameSite=Lax; {lifetimePart}{securePart}";
    }
}
