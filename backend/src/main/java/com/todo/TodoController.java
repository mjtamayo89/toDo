package com.todo;

import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

  private final TodoService todoService;

  public TodoController(TodoService todoService) {
    this.todoService = todoService;
  }

  @GetMapping
  public List<Todo> list() {
    return todoService.findAll();
  }

  @PostMapping
  public Todo create(@RequestBody CreateTodoRequest request) {
    return todoService.create(request.text());
  }

  @PatchMapping("/{id}")
  public Todo toggle(@PathVariable String id) {
    return todoService.toggle(id);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable String id) {
    todoService.delete(id);
  }
}
