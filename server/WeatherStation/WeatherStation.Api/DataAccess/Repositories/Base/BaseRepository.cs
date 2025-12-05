using Microsoft.EntityFrameworkCore;
using WeatherStation.Api.DataAccess.Contexts;
using WeatherStation.Api.Models.Base;

namespace WeatherStation.Api.DataAccess.Repositories.Base;

public class BaseRepository<T> : IBaseRepository<T> where T : BaseEntity
{
    protected readonly WeatherStationDbContext context;

    public BaseRepository(WeatherStationDbContext context)
    {
        this.context = context;
    }

    public virtual T Create(T entity)
    {
        context.Set<T>().Add(entity);
        return entity;
    }

    public virtual async Task<T?> GetById(int id)
    {
        return await context.Set<T>().FirstOrDefaultAsync(x => x.Id == id);
    }

    public virtual async Task<List<T>> GetByQuery(Func<IQueryable<T>, IQueryable<T>> query)
    {
        IQueryable<T> q = query(context.Set<T>().AsQueryable());
        return await q.ToListAsync();
    }

    public virtual async Task<List<T>> GetList()
    {
        return await context.Set<T>().ToListAsync();
    }

    public virtual void Remove(T entity)
    {
        context.Set<T>().Remove(entity);
    }

    public async Task SaveChanges()
    {
        await context.SaveChangesAsync();
    }

    public virtual T Update(T entity)
    {
        context.Set<T>().Update(entity);
        return entity;
    }
}
