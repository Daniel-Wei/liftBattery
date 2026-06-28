namespace LiftBattery.Api.Data.Entities;

public sealed class User
{
    public int Id { get; set; }
    public required string DisplayName { get; set; }
    public required string Email { get; set; }
    public required string NormalizedEmail { get; set; }
    public required string PasswordHash { get; set; }
    public string? TrainingGoal { get; set; }
    public int WeeklyTargetTrainingDays { get; set; } = 4;
    public string PreferredUnit { get; set; } = "kg";
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
    public ICollection<AuthSession> AuthSessions { get; set; } = new List<AuthSession>();
}
