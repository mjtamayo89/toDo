package com.todo;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TodoController.class)
class TodoControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private TodoService todoService;

  @Test
  void listDevuelveLasTareas() throws Exception {
    given(todoService.findAll())
        .willReturn(List.of(new Todo("1", "Comprar leche", false)));

    mockMvc
        .perform(get("/api/todos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].text").value("Comprar leche"));
  }

  @Test
  void createDevuelveLaTareaCreada() throws Exception {
    given(todoService.create("Estudiar")).willReturn(new Todo("1", "Estudiar", false));

    mockMvc
        .perform(
            post("/api/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"text\":\"Estudiar\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.text").value("Estudiar"))
        .andExpect(jsonPath("$.done").value(false));
  }

  @Test
  void toggleActualizaElEstado() throws Exception {
    given(todoService.toggle("1")).willReturn(new Todo("1", "Estudiar", true));

    mockMvc
        .perform(patch("/api/todos/{id}", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.done").value(true));

    verify(todoService).toggle("1");
  }

  @Test
  void deleteLlamaAlServicioConElId() throws Exception {
    mockMvc.perform(delete("/api/todos/{id}", "1")).andExpect(status().isOk());

    verify(todoService).delete(eq("1"));
  }
}
