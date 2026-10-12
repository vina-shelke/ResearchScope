package com.researchscope.controller;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.PaginatedResponse;
import com.researchscope.dto.PaperDTO;
import com.researchscope.service.AuthorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    private final AuthorService authorService;

    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<AuthorDTO>> getAuthors(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(authorService.searchAuthors(query, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthorDTO> getAuthorById(@PathVariable("id") String id) {
        return authorService.getAuthorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/papers")
    public ResponseEntity<List<PaperDTO>> getPapersByAuthor(@PathVariable("id") String id) {
        return ResponseEntity.ok(authorService.getPapersByAuthor(id));
    }
}
