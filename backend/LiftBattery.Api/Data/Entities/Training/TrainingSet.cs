namespace LiftBattery.Api.Data.Entities.Training;

public sealed class TrainingSet
{
    public int Id { get; set; }
    public int TrainingExerciseId { get; set; }
    public required int SetOrder { get; set; }
    public required int Reps { get; set; }
    public required decimal WeightKg { get; set; }
    public required bool IsWarmUp { get; set; }
    public decimal? Rpe { get; set; }
    public decimal? Rir { get; set; }
    public required TrainingExercise TrainingExercise { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
