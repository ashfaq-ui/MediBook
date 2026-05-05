import org.junit.jupiter.api.Test;

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
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration",
        "anthropic.api.key=test-key-not-real",
        "anthropic.api.url=https://api.anthropic.com/v1/messages",
        "anthropic.model=claude-sonnet-4-20250514"
})
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }
}