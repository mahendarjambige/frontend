package com.example.survey.config;

import com.example.survey.entity.*;
import com.example.survey.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Value("${app.admin.email:mahendarjambige@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.password:Maahi@0007}")
    private String adminPassword;

    private final UserRepository userRepository;
    private final SurveyRepository surveyRepository;
    private final PollRepository pollRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           SurveyRepository surveyRepository,
                           PollRepository pollRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.surveyRepository = surveyRepository;
        this.pollRepository = pollRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String designatedAdminEmail = adminEmail.trim().toLowerCase();

        // 1. Enforce Single-Admin rule on existing users:
        // Any account that currently has ROLE_ADMIN but does NOT match the designated admin email
        // is converted to ROLE_PARTICIPANT.
        List<User> existingAdmins = userRepository.findByRole(Role.ROLE_ADMIN);
        for (User u : existingAdmins) {
            if (!u.getEmail().equalsIgnoreCase(designatedAdminEmail)) {
                u.setRole(Role.ROLE_PARTICIPANT);
                userRepository.save(u);
            }
        }

        // 2. Seed or ensure the single designated Admin account
        User admin = userRepository.findByEmail(designatedAdminEmail).orElseGet(() -> {
            User u = new User();
            u.setName("Admin (Mahendar)");
            u.setEmail(designatedAdminEmail);
            u.setPassword(passwordEncoder.encode(adminPassword));
            u.setRole(Role.ROLE_ADMIN);
            return userRepository.save(u);
        });

        // Ensure its role is strictly ROLE_ADMIN and password is up-to-date
        admin.setRole(Role.ROLE_ADMIN);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin = userRepository.save(admin);

        // 3. Seed Participant Users
        User john = userRepository.findByEmail("john@survey.com").orElseGet(() -> {
            User u = new User();
            u.setName("John Doe");
            u.setEmail("john@survey.com");
            u.setPassword(passwordEncoder.encode("john123"));
            u.setRole(Role.ROLE_PARTICIPANT);
            return userRepository.save(u);
        });

        User jane = userRepository.findByEmail("jane@survey.com").orElseGet(() -> {
            User u = new User();
            u.setName("Jane Smith");
            u.setEmail("jane@survey.com");
            u.setPassword(passwordEncoder.encode("jane123"));
            u.setRole(Role.ROLE_PARTICIPANT);
            return userRepository.save(u);
        });

        // 4. Seed Sample Surveys if none exist
        if (surveyRepository.count() == 0) {
            Survey survey1 = new Survey();
            survey1.setTitle("Campus Facilities & Student Satisfaction Survey");
            survey1.setDescription("Please provide your honest feedback regarding campus library, labs, and cafeteria facilities.");
            survey1.setCreatedBy(admin);
            survey1.setStartDate(LocalDate.now());
            survey1.setEndDate(LocalDate.now().plusMonths(2));
            survey1.setStatus(SurveyStatus.PUBLISHED);

            // Question 1: Multiple Choice
            Question q1 = new Question();
            q1.setQuestionText("How satisfied are you with the university computer lab facilities?");
            q1.setQuestionType(QuestionType.MULTIPLE_CHOICE);
            q1.addOption(new Option(null, null, "Extremely Satisfied"));
            q1.addOption(new Option(null, null, "Satisfied"));
            q1.addOption(new Option(null, null, "Neutral"));
            q1.addOption(new Option(null, null, "Dissatisfied"));
            survey1.addQuestion(q1);

            // Question 2: Checkbox
            Question q2 = new Question();
            q2.setQuestionText("Which campus resources do you utilize most frequently? (Select all that apply)");
            q2.setQuestionType(QuestionType.CHECKBOX);
            q2.addOption(new Option(null, null, "Digital Library & IEEE Access"));
            q2.addOption(new Option(null, null, "High-Speed Wi-Fi"));
            q2.addOption(new Option(null, null, "Study Rooms & Discussion Lounges"));
            q2.addOption(new Option(null, null, "Cafeteria & Food Court"));
            survey1.addQuestion(q2);

            // Question 3: Text Answer
            Question q3 = new Question();
            q3.setQuestionText("What improvements would you like to see on campus in the next semester?");
            q3.setQuestionType(QuestionType.TEXT);
            survey1.addQuestion(q3);

            surveyRepository.save(survey1);

            Survey survey2 = new Survey();
            survey2.setTitle("Web Development Framework Preference 2026");
            survey2.setDescription("A survey among engineering students regarding modern web frameworks and full-stack tools.");
            survey2.setCreatedBy(admin);
            survey2.setStartDate(LocalDate.now());
            survey2.setEndDate(LocalDate.now().plusMonths(1));
            survey2.setStatus(SurveyStatus.PUBLISHED);

            Question q21 = new Question();
            q21.setQuestionText("Which backend technology do you feel most confident using?");
            q21.setQuestionType(QuestionType.MULTIPLE_CHOICE);
            q21.addOption(new Option(null, null, "Spring Boot (Java)"));
            q21.addOption(new Option(null, null, "Node.js / Express"));
            q21.addOption(new Option(null, null, "FastAPI / Django (Python)"));
            q21.addOption(new Option(null, null, "ASP.NET Core (C#)"));
            survey2.addQuestion(q21);

            Question q22 = new Question();
            q22.setQuestionText("What challenges do you face when learning full-stack web development?");
            q22.setQuestionType(QuestionType.TEXT);
            survey2.addQuestion(q22);

            surveyRepository.save(survey2);
        }

        // 5. Seed Sample Polls if none exist
        if (pollRepository.count() == 0) {
            Poll poll1 = new Poll();
            poll1.setTitle("Which programming language is your favorite in 2026?");
            poll1.setDescription("Quick community poll to see which language students and developers love the most.");
            poll1.setCreatedBy(admin);
            poll1.setStartDate(LocalDate.now());
            poll1.setEndDate(LocalDate.now().plusMonths(1));
            poll1.setStatus(SurveyStatus.PUBLISHED);

            poll1.addOption(new PollOption(null, null, "Java"));
            poll1.addOption(new PollOption(null, null, "Python"));
            poll1.addOption(new PollOption(null, null, "JavaScript / TypeScript"));
            poll1.addOption(new PollOption(null, null, "C++ / Rust"));

            pollRepository.save(poll1);

            Poll poll2 = new Poll();
            poll2.setTitle("Should AI coding assistants be permitted in practical programming exams?");
            poll2.setDescription("Share your opinion on integrating generative AI into programming assessments.");
            poll2.setCreatedBy(admin);
            poll2.setStartDate(LocalDate.now());
            poll2.setEndDate(LocalDate.now().plusMonths(2));
            poll2.setStatus(SurveyStatus.PUBLISHED);

            poll2.addOption(new PollOption(null, null, "Yes, with proper guidelines"));
            poll2.addOption(new PollOption(null, null, "Yes, fully permitted as an industry reality"));
            poll2.addOption(new PollOption(null, null, "No, students must write raw code"));

            pollRepository.save(poll2);
        }
    }
}
