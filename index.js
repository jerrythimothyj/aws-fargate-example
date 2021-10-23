const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (request, response) => {
    return response.send("Hello, world")
});

app.get("/todos", (request, response) => {
    const showPending = request.query.showpending;

    fs.readFile("./store/todos.json", "utf-8", (error, data) => {
        if(error) {
            return response.status(500).send("Sorry, something went wrong");
        }

        const todos = JSON.parse(data);
        if(showPending) {
            
            return response.json({todos: todos.filter(todo => {
                return todo.complete === false
            })})
        } else {
            return response.json({todos}) 
        }
    });
});

app.post("/todo", (request, response) => {
    if(!request.body.name) {
        return response.status(400).send("Missing name")
    }

    fs.readFile("./store/todos.json", "utf-8", (error, data) => {
        if(error) {
            return response.status(500).send("Sorry, something went wrong");
        }

        const todos = JSON.parse(data);
        const maxId = Math.max.apply(Math, todos.map(todo => { return todo.id }))
        
        todos.push({
            id: maxId + 1,
            complete: false,
            name: request.body.name
        })

        fs.writeFile("./store/todos.json", JSON.stringify(todos), () => {
            return response.json({status: 'ok'})
        });
    });
})

app.put("/todos/:id/complete", (request, response) => {
    const id = parseInt(request.params.id);

    const findTodoById = (todos, id) => {
        for (let i = 0; i < todos.length; i++) {
            if(todos[i].id === id) {
                return i;
            }
        }

        return -1;
    }

    fs.readFile("./store/todos.json", "utf-8", (error, data) => {
        if(error) {
            return response.status(500).send("Sorry, something went wrong");
        }

        let todos = JSON.parse(data);
        const todosIndex = findTodoById(todos, id)

        if(todosIndex === -1) {
            return response.status(404).send("Not found")
        }

        todos[todosIndex].complete = !todos[todosIndex].complete;

        fs.writeFile("./store/todos.json", JSON.stringify(todos), () => {
            return response.json({status: 'ok'})
        });
    });
});

app.listen(3000, () => {
    console.log('Application is running on http://localhost:3000');
});