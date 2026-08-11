package com.todo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class TodoServiceTest {

  private TodoService todoService;

  @BeforeEach
  void setUp() {
    todoService = new TodoService();
  }

  @Test
  void findAllEmptyAlInicio() {
    assertThat(todoService.findAll()).isEmpty();
  }

  @Test
  void createAgregaUnaTareaNueva() {
    Todo todo = todoService.create("Comprar leche");

    assertThat(todo.text()).isEqualTo("Comprar leche");
    assertThat(todo.done()).isFalse();
    assertThat(todoService.findAll()).containsExactly(todo);
  }

  @Test
  void createRecortaEspaciosDelTexto() {
    Todo todo = todoService.create("  Estudiar  ");

    assertThat(todo.text()).isEqualTo("Estudiar");
  }

  @Test
  void createConTextoVacioLanzaBadRequest() {
    assertThatThrownBy(() -> todoService.create("   "))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("400");
  }

  @Test
  void toggleCambiaElEstadoDeDone() {
    Todo creado = todoService.create("Estudiar");

    Todo actualizado = todoService.toggle(creado.id());

    assertThat(actualizado.done()).isTrue();
    assertThat(actualizado.id()).isEqualTo(creado.id());
  }

  @Test
  void toggleConIdInexistenteLanzaNotFound() {
    assertThatThrownBy(() -> todoService.toggle("id-que-no-existe"))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("404");
  }

  @Test
  void deleteEliminaLaTarea() {
    Todo creado = todoService.create("Borrar esto");

    todoService.delete(creado.id());

    assertThat(todoService.findAll()).isEmpty();
  }

  @Test
  void deleteConIdInexistenteLanzaNotFound() {
    assertThatThrownBy(() -> todoService.delete("id-que-no-existe"))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("404");
  }
}
