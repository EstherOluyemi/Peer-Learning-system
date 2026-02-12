export const mockSessions = [
  {
    id: 1,
    title: "Introduction to React Hooks",
    tutor: "Jane Smith",
    tutorId: 101,
    subject: "Web Development",
    description: "Learn about useState, useEffect, and custom hooks",
    date: "2024-12-15",
    time: "14:00",
    duration: "60 mins",
    maxLearners: 20,
    enrolled: 12,
    level: "Beginner",
    tags: ["React", "JavaScript", "Frontend"]
  },
  // Add more mock sessions...
];

export const mockUsers = {
  tutor: {
    id: 101,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "tutor",
    password: "Tutor@123", // Add password for mock login
    bio: "Senior Frontend Developer with 5+ years experience",
    subjects: ["React", "JavaScript", "TypeScript"],
    rating: 4.8
  },
  learner: {
    id: 201,
    name: "John Doe",
    email: "john@example.com",
    role: "learner",
    password: "Learner@123", // Add password for mock login
    bio: "Computer Science student passionate about web development",
    interests: ["React", "Node.js", "UI/UX"]
  }
};