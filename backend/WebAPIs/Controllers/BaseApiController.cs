using Application.Interface;
using Application.Response;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebAPIs.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    private IMediator _mediator;
    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetService<IMediator>();

    protected IActionResult HandleResponse(IResponse result)
    {
        if (result is ErrorResponse err)
        {
            return StatusCode(err.Code, new { success = false, message = err.Message });
        }

        var success = (SuccessResponse)result;
        return StatusCode(success.Code, new
        {
            success = true,
            message = success.Message,
            data = success.Data > 0 ? success.Data : (object?)null
        });
    }
}
class ResponseTemplate
{
    public static IActionResult get(BaseApiController controller, IResponse result)
    {
        if (result is ErrorResponse errorResponse)
        {
            if (errorResponse.Code == 404)
            {
                return controller.NotFound(errorResponse.Message);
            }
            if (errorResponse.Code == 400)
            {
                return controller.BadRequest(errorResponse.Message);
            }
        }
        return controller.Ok(((SuccessResponse)result).Data);
    }
}