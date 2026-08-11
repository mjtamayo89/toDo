package com.todo;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TodoService {

  private final Map<String, Todo> todos = new ConcurrentHashMap<>();

  public List<Todo> findAll() {
    return new ArrayList<>(todos.values());
  }

  public Todo create(String text) {
    String trimmed = text == null ? "" : text.trim();
    if (trimmed.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El texto no puede estar vacío");
    }

    Todo todo = new Todo(UUID.randomUUID().toString(), trimmed, false);
    todos.put(todo.id(), todo);
    return todo;
  }

  public Todo toggle(String id) {
    Todo todo = todos.get(id);
    if (todo == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarea no encontrada");
    }

    Todo updated = new Todo(todo.id(), todo.text(), !todo.done());
    todos.put(id, updated);
    return updated;
  }

  public void delete(String id) {
    if (todos.remove(id) == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarea no encontrada");
    }
  }
}
