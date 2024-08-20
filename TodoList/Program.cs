using TodoList.Data;
using TodoList.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<TodoContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("TodoContext") ?? throw new InvalidOperationException("Connection string 'TodoContext' not found.")));


var app = builder.Build();

var todoItems = app.MapGroup("/todoitems");

todoItems.MapGet("/", GetAllTodoItems);
todoItems.MapGet("/{id}", GetTodoItem);
todoItems.MapPost("/", CreateTodoItem);
todoItems.MapPut("/{id}", UpdateTodoItem);
todoItems.MapDelete("/{id}", DeleteTodoItem);

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");


app.Run();


static async Task<IResult> GetAllTodoItems(TodoContext db)
{
    return TypedResults.Ok(await db.TodoItems.ToArrayAsync());
}

static async Task<IResult> GetTodoItem(TodoContext db, int id)
{
    return await db.TodoItems.FindAsync(id)
        is TodoItem todo
            ? TypedResults.Ok(todo)
            : TypedResults.NotFound();
}

static async Task<IResult> CreateTodoItem(TodoContext db, TodoItem todo)
{
    db.TodoItems.Add(todo);
    await db.SaveChangesAsync();
    return TypedResults.Created($"/todoitems/{todo.Id}", todo);
}

static async Task<IResult> UpdateTodoItem(TodoContext db, TodoItem inputTodo, int id)
{
    var todo = await db.TodoItems.FindAsync(id);

    if (todo is null) return TypedResults.NotFound();

    todo.Name = inputTodo.Name;
    todo.IsComplete = inputTodo.IsComplete;

    await db.SaveChangesAsync();
    return TypedResults.NoContent();
}

static async Task<IResult> DeleteTodoItem(TodoContext db, int id)
{
    if (await db.TodoItems.FindAsync(id) is TodoItem todo)
    {
        db.TodoItems.Remove(todo);
        db.SaveChanges();
        return TypedResults.NoContent();
    }

    return TypedResults.NotFound();


}