namespace LiftBattery.Api.Models;

public sealed record PreCheckModel(
    int Id,
    int UserId,
    DateOnly Date,
    decimal SleepHours,
    int SorenessRating,
    int MotivationRating,
    int RestingHeartRateDelta,
    int PreviousSessionRpe,
    int PreviousSessionDurationMinutes,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc)
{
    public int SleepQuality => SleepHours switch
    {
        >= 8 => 5,
        >= 7 => 4,
        >= 6 => 3,
        >= 5 => 2,
        _ => 1,
    };

    public int Soreness => ScaleTenToFive(SorenessRating);

    public int Stress => RestingHeartRateDelta switch
    {
        <= 0 => 1,
        <= 4 => 2,
        <= 8 => 3,
        <= 12 => 4,
        _ => 5,
    };

    public int Motivation => ScaleTenToFive(MotivationRating);

    public int Energy => Motivation;

    private static int ScaleTenToFive(int value)
    {
        return Math.Clamp((int)Math.Round(value / 2m, MidpointRounding.AwayFromZero), 1, 5);
    }
}
