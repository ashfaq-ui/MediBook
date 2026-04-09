package com.MediBook.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "jwt.secret=test-secret-key-for-github-actions-testing-only-must-be-long",
    "jwt.expiration=86400000",
    "spring.mail.host=smtp.gmail.com",
    "spring.mail.username=test@test.com",
    "spring.mail.password=test",
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration"
})
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
