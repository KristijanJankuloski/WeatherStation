using Microsoft.AspNetCore.Mvc;
using WeatherStation.Api.Shared.Results;

namespace WeatherStation.Api.Controllers.Base;

public abstract class BaseController : ControllerBase
{
    protected IActionResult OkOrError(Result result)
    {
        if (result.HasFailed)
        {
            return BadRequest(result.Error);
        }
        else
        {
            return NoContent();
        }
    }

    protected IActionResult OkOrError<T>(Result<T> result)
    {
        if (result.HasFailed)
        {
            return BadRequest(result.Error);
        }
        else
        {
            return Ok(result.Value);
        }
    }

    protected IActionResult InternalServerError(Exception exception)
    {
        return StatusCode(StatusCodes.Status500InternalServerError, exception.Message);
    }
}
