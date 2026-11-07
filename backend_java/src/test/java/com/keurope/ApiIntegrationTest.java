package com.keurope;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {

    @TempDir
    static Path tempDir;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("DB_PATH", () -> tempDir.resolve("test.db").toString());
    }

    @Autowired
    MockMvc mvc;

    @Test
    void listsSeededProductsWithPagination() throws Exception {
        mvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.items", hasSize(72)))
                .andExpect(jsonPath("$.data.pagination.totalPages").value(1));
    }

    @Test
    void filtersProductsByCategory() throws Exception {
        mvc.perform(get("/api/products").param("category", "Outerwear"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].category").value("Outerwear"));
    }

    @Test
    void returnsNotFoundForUnknownProduct() throws Exception {
        mvc.perform(get("/api/products/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    void answersPreflightWithoutToken() throws Exception {
        mvc.perform(options("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }

    @Test
    void rejectsCartWithoutToken() throws Exception {
        mvc.perform(get("/api/cart"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Unauthorized\n"));
    }

    @Test
    void rejectsWeakPassword() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"weak@example.com\",\"password\":\"short\"}"))
                .andExpect(status().isConflict())
                .andExpect(content().string("Failed to register: password must be at least 10 characters\n"));
    }

    @Test
    void registeredUserCanFillCart() throws Exception {
        String token = registerUser();
        String auth = "Bearer " + token;

        mvc.perform(post("/api/cart").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"product_id\":\"1\",\"quantity\":2,\"size\":\"M\"}"))
                .andExpect(status().isOk());
        // Same product and size bumps the quantity instead of adding a row
        mvc.perform(post("/api/cart").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"product_id\":\"1\",\"quantity\":1,\"size\":\"M\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(3));

        mvc.perform(get("/api/cart").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.total").value(189.0 * 3));

        mvc.perform(delete("/api/cart/clear").header("Authorization", auth))
                .andExpect(jsonPath("$.status").value("cleared"));
    }

    @Test
    void adminRoutesRejectUserTokens() throws Exception {
        mvc.perform(get("/api/admin/orders").header("Authorization", "Bearer " + registerUser()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid or expired token"));
    }

    @Test
    void adminCreatesProductsWithIncrementingIds() throws Exception {
        String auth = "Bearer " + adminToken();
        String body = "{\"title\":\"Test\",\"price\":10,\"category\":\"Tops\"}";

        String first = mvc.perform(post("/api/admin/products").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String second = mvc.perform(post("/api/admin/products").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        int firstId = Integer.parseInt(JsonPath.read(first, "$.data.id"));
        int secondId = Integer.parseInt(JsonPath.read(second, "$.data.id"));
        assertEquals(firstId + 1, secondId);

        mvc.perform(delete("/api/admin/products/" + firstId).header("Authorization", auth)).andExpect(status().isOk());
        mvc.perform(delete("/api/admin/products/" + secondId).header("Authorization", auth)).andExpect(status().isOk());
    }

    private String registerUser() throws Exception {
        String email = UUID.randomUUID() + "@example.com";
        String response = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"Str0ng!Passw\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.token");
    }

    private String adminToken() throws Exception {
        String response = mvc.perform(post("/api/admin/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.token");
    }
}
