package com.example.orderservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");

        System.out.println("🔍 Processing request: " + requestURI);
        System.out.println("🔍 Auth Header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            System.out.println("🔍 Extracted JWT: " + jwt.substring(0, Math.min(20, jwt.length())) + "...");
            
            try {
                String username = jwtUtil.extractUsername(jwt);
                System.out.println("🔍 Extracted Username: " + username);

                if (username != null) {
                    boolean isValid = jwtUtil.validateToken(jwt, username);
                    System.out.println("🔍 Token Valid: " + isValid);
                    
                    boolean hasAuth = SecurityContextHolder.getContext().getAuthentication() != null;
                    System.out.println("🔍 Already Authenticated: " + hasAuth);
                    
                    if (isValid && !hasAuth) {
                        // ✅ Give ROLE_USER
                        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));

                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username,
                                null, authorities);

                        SecurityContextHolder.getContext().setAuthentication(authToken);

                        System.out.println("✅ Authentication Set Successfully for: " + username);
                    } else {
                        System.out.println("❌ Authentication failed - Valid: " + isValid + ", HasAuth: " + hasAuth);
                    }
                } else {
                    System.out.println("❌ Username is null");
                }
            } catch (Exception e) {
                System.out.println("❌ JWT Processing Error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("❌ No valid Authorization header found");
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        boolean shouldSkip = request.getRequestURI().startsWith("/api/auth/");
        if (shouldSkip) {
            System.out.println("⏭️ Skipping JWT filter for: " + request.getRequestURI());
        }
        return shouldSkip;
    }
}