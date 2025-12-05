using System.ComponentModel.DataAnnotations.Schema;

namespace WeatherStation.Api.Models.Base;

public abstract class BaseEntity
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }
}
