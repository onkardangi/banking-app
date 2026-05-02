package com.banking.app.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * @author onkardangi
 * @date 5/1/26
 * @time 16:12
 */

@RestController
@RequestMapping("/api")
public class TestController {

    @RequestMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Banking App Backend is running!");
        return response;
    }

}
