package com.skillnest.backend.service;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillnest.backend.dto.DocumentDTO;

public class GetRecommendations {

    public List<Map<String, Object>> getRecommendationsService(DocumentDTO documentDTO) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "http://127.0.0.1:5000/recommend";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<DocumentDTO> request = new HttpEntity<>(documentDTO, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, Object>> result = mapper.readValue(
                    response.getBody(),
                    new TypeReference<List<Map<String, Object>>>() {}
                );
                return result;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ArrayList<>();
    }
}
