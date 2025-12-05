using WeatherStation.Api.Models.Base;

namespace WeatherStation.Api.DataAccess.Repositories.Base;

public interface IBaseRepository<T> where T : BaseEntity
{
    Task<T?> GetById(int id);

    T Update(T entity);

    T Create(T entity);

    void Remove(T entity);

    Task<List<T>> GetList();

    Task<List<T>> GetByQuery(Func<IQueryable<T>, IQueryable<T>> query);

    Task SaveChanges();
}
