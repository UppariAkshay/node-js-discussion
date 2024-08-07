const express = require('express')
const path = require('path')
const {format} = require('date-fns')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const app = express()
app.use(express.json())

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error is ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

app.get('/todos/', async (request, response) => {
  const {id, todo, category, priority, status, due_date, search_q} =
    request.query
  if (
    status !== undefined &&
    id === undefined &&
    category === undefined &&
    priority === undefined &&
    due_date === undefined
  ) {
    const getTodosQuery = `
    SELECT *
    FROM todo ;`
    const todosList = await db.all(getTodosQuery)
    response.send(todosList)
  } else if (
    status === undefined &&
    id === undefined &&
    category === undefined &&
    priority !== undefined &&
    due_date === undefined
  ) {
    const getHighPriorityTodos = `
        SELECT *
        FROM todo
        WHERE priority = '${priority}';`
    const highPriorityTodosList = await db.all(getHighPriorityTodos)
    response.send(highPriorityTodosList)
  } else if (
    status !== undefined &&
    id === undefined &&
    category === undefined &&
    priority !== undefined &&
    due_date === undefined
  ) {
    const getStatusAndPriority = `
        SELECT *
        FROM todo
        WHERE priority = '${priority}' AND status = '${status}';`

    const statusAndPriorityList = await db.all(getStatusAndPriority)
    response.send(statusAndPriorityList)
  } else if (search_q !== undefined) {
    const {search_q} = request.query
    const searchQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%';`

    const searchedResults = await db.all(searchQuery)
    response.send(searchedResults)
  } else if (
    status !== undefined &&
    id === undefined &&
    category !== undefined &&
    priority === undefined &&
    due_date === undefined
  ) {
    const statusAndCategoryQuery = `
        SELECT *
        FROM todo
        WHERE category LIKE '${category}' AND status LIKE '${status}';`

    const statusAndCategoryList = await db.all(statusAndCategoryQuery)
    response.send(statusAndCategoryList)
  } else if (
    status === undefined &&
    id === undefined &&
    category !== undefined &&
    priority === undefined &&
    due_date === undefined
  ) {
    const categorySpecificQuery = `
        SELECT *
        FROM todo
        WHERE category = '${category}';`

    const categoryItemsList = await db.all(categorySpecificQuery)
    response.send(categoryItemsList)
  } else if (
    status === undefined &&
    id === undefined &&
    category !== undefined &&
    priority !== undefined &&
    due_date === undefined
  ) {
    const categoryAndPriorityQuery = `
        SELECT *
        FROM todo
        WHERE category = '${category}' AND priority = '${priority}';`
    const categoryAndPriorityList = await db.all(categoryAndPriorityQuery)
    response.send(categoryAndPriorityList)
  }
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  console.log(todoId)
  const getSpecificTodo = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`

  const todoItem = await db.get(getSpecificTodo)
  response.send(todoItem)
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  const dateObj = new Date(date)
  const formattedDate = format(dateObj, 'yyyy-MM-dd')

  response.send(date)

  const dueDateTodosQuery = `
  SELECT *
  FROM todo
  WHERE due_date = ${formattedDate};`

  const dueDateTodosList = await db.all(dueDateTodosQuery)
  response.send(dueDateTodosList)
})

// Create todo query
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body

  response.send(todo)
  const createTodoQuery = `
  INSERT INTO todo
  (id, todo, priority, status, category, due_date)
  values(
      ${id},
      '${todo}',
      '${priority}',
      '${status}',
      '${category}',
      ${dueDate}
  );`

  await db.run(createTodoQuery)
  response.send('Todo Successfully Added')
})

//Update todo item query
app.put('/todos/:todoId/', async (request, response) => {
  const {todo, category, priority, status, dueDate} = request.body

  if (status !== undefined) {
    const updateStatus = `
        UPDATE todo
        SET status = '${status}';`
    await db.run(updateStatus)
    response.send('Status Updated')
  } else if (priority !== undefined) {
    const updatePriority = `
        UPDATE todo
        SET priority = '${priority}';`

    await db.run(updatePriority)
    response.send('Priority Updated')
  } else if (todo !== undefined) {
    const updateTodo = `
        UPDATE todo
        SET todo = '${todo}';`

    await db.run(updateTodo)
    response.send('Todo Updated')
  } else if (category !== undefined) {
    const updateCategory = `
        UPDATE todo
        SET category = '${category}';`

    await db.run(updateCategory)
    response.send('Category Updated')
  } else if (dueDate !== undefined) {
    const updateDueDate = `
        UPDATE todo
        SET due_date = ${dueDate};`

    await db.run(updateDueDate)
    response.send('Due Date Updated')
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodo = `
    DELETE FROM
    todo
    WHERE id = ${todoId};`
  await db.run(deleteTodo)
  response.send('Todo Deleted')
})

module.exports = app
