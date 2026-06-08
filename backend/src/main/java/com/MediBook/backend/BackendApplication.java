package com.MediBook.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
@EnableAsync
public class BackendApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(BackendApplication.class, args);
	}

	private static void loadDotEnv() {
		String[] possiblePaths = { ".env", "backend/.env", "../backend/.env" };
		for (String pathStr : possiblePaths) {
			Path path = Paths.get(pathStr);
			if (Files.exists(path)) {
				try {
					Files.lines(path)
						.map(String::trim)
						.filter(line -> !line.isEmpty() && !line.startsWith("#"))
						.forEach(line -> {
							int delim = line.indexOf('=');
							if (delim > 0) {
								String key = line.substring(0, delim).trim();
								String value = line.substring(delim + 1).trim();
								// Remove surrounding quotes if any
								if ((value.startsWith("\"") && value.endsWith("\"")) ||
									(value.startsWith("'") && value.endsWith("'"))) {
									value = value.substring(1, value.length() - 1);
								}
								System.setProperty(key, value);
							}
						});
					System.out.println("Loaded environment variables from " + path.toAbsolutePath());
					break;
				} catch (IOException e) {
					System.err.println("Failed to read env file: " + e.getMessage());
				}
			}
		}
	}
}
