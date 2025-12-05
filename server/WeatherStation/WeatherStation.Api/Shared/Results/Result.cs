namespace WeatherStation.Api.Shared.Results;

public class Result
{
    public bool IsSuccessful { get; set; }

    public bool HasFailed { get { return !IsSuccessful; } }

    public string? Error { get; set; }

    public Result(bool isSuccessful, string? error)
    {
        IsSuccessful = isSuccessful;
        Error = error;
    }

    public Result() { }

    public static Result Invalid(string message)
    {
        return new Result(false, message);
    }

    public static Result Ok()
    {
        return new Result(true, null);
    }
}

public class Result<T> : Result
{
    public T Value { get; set; }

    public Result(T value, string? message)
    {
        IsSuccessful = true;
        Error = null;
        Value = value;
    }

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
    public Result(string message)
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
    {
        IsSuccessful = false;
        Error = message;
    }

    public static new Result<T> Ok(T value)
    {
        return new Result<T>(value, null);
    }

    public static new Result<T> Invalid(string message)
    {
        return new Result<T>(message);
    }
}
