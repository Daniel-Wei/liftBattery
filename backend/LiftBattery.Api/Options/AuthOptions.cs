namespace LiftBattery.Api.Options;

public sealed class AuthOptions
{
    public const string SectionName = "Auth";

    public string BetaInviteCode { get; set; } = string.Empty;
    public string CookieName { get; set; } = "LiftBattery.Session";
    public bool RequireSecureCookie { get; set; }
    public int SessionDays { get; set; } = 14;
}
