# Contributing to ShareFilesCF

Thank you for your interest in contributing to ShareFilesCF! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue templates** when available
3. **Provide clear reproduction steps** for bugs
4. **Include relevant system information** (OS, browser, Node.js version)

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing feature requests** first
2. **Explain the use case** and why it would be valuable
3. **Consider the scope** - keep it focused and achievable
4. **Think about implementation** - how might it work?

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** from `main`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Submit a pull request**

## 🛠️ Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Cloudflare account (for testing)

### Local Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/sharefilescf.git
cd sharefilescf

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development servers
npm run dev
```

### Project Structure

```
sharefilescf/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/ # Reusable React components
│   │   ├── lib/       # Utilities and API client
│   │   └── types/     # TypeScript type definitions
├── backend/           # Cloudflare Workers backend
│   ├── src/
│   │   ├── handlers/  # API route handlers
│   │   ├── services/  # Business logic services
│   │   ├── utils/     # Utility functions
│   │   └── types/     # TypeScript type definitions
├── database/          # D1 database migrations
├── scripts/           # Deployment and setup scripts
└── docs/             # Documentation files
```

## 📝 Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Define proper types** - avoid `any`
- **Use interfaces** for object shapes
- **Export types** from dedicated type files

```typescript
// Good
interface FileUploadRequest {
  file: File;
  expiryHours?: number;
  password?: string;
}

// Avoid
function uploadFile(data: any) { ... }
```

### Code Style

We use ESLint and Prettier for consistent formatting:

```bash
# Check linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format
```

### Naming Conventions

- **Files**: kebab-case (`file-upload.tsx`)
- **Components**: PascalCase (`FileUpload`)
- **Functions**: camelCase (`uploadFile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`FileUploadRequest`)

### Component Guidelines

```typescript
// Use functional components with TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- file-upload.test.ts
```

### Writing Tests

- **Write tests** for all new functionality
- **Use descriptive test names** that explain what is being tested
- **Follow the AAA pattern**: Arrange, Act, Assert
- **Mock external dependencies** appropriately

```typescript
// Good test example
describe('FileUpload Component', () => {
  it('should display error when file size exceeds limit', async () => {
    // Arrange
    const oversizedFile = new File(['x'.repeat(11000000)], 'large.txt');
    
    // Act
    render(<FileUpload />);
    const input = screen.getByLabelText(/upload file/i);
    await user.upload(input, oversizedFile);
    
    // Assert
    expect(screen.getByText(/file too large/i)).toBeInTheDocument();
  });
});
```

### Test Coverage

Aim for:
- **80%+ overall coverage**
- **90%+ for critical paths** (upload, download, security)
- **100% for utility functions**

## 📚 Documentation

### Code Documentation

- **Use JSDoc** for functions and classes
- **Comment complex logic** and business rules
- **Keep comments up-to-date** with code changes

```typescript
/**
 * Generates a secure filename for storage
 * @param originalFilename - The original filename from user
 * @returns A secure filename with random prefix
 */
export function generateSecureFilename(originalFilename: string): string {
  const extension = originalFilename.split('.').pop() || '';
  const randomId = generateId(16);
  return extension ? `${randomId}.${extension}` : randomId;
}
```

### README Updates

When adding features:
- Update the main README.md
- Add examples if applicable
- Update the feature list
- Consider adding to Quick Start guide

## 🔒 Security Considerations

### Security Review

All contributions are reviewed for security implications:

- **Input validation** - validate all user inputs
- **Output encoding** - prevent XSS attacks
- **Access control** - ensure proper authorization
- **Data handling** - follow privacy principles

### Reporting Security Issues

**Do not** create public issues for security vulnerabilities. Instead:

1. Email security@yourproject.com (if available)
2. Use GitHub's private vulnerability reporting
3. Provide detailed reproduction steps
4. Allow time for fix before disclosure

## 🚀 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No merge conflicts with main branch

### PR Description

Include:
- **Summary** of changes
- **Motivation** for the change
- **Testing** performed
- **Screenshots** for UI changes
- **Breaking changes** if any

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainers
3. **Testing** in staging environment
4. **Approval** and merge

## 🏷️ Commit Guidelines

Use conventional commits:

```
type(scope): description

feat(upload): add drag and drop support
fix(auth): resolve password validation issue
docs(api): update endpoint documentation
test(utils): add tests for file validation
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting changes
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🎯 Areas for Contribution

### High Priority

- **Performance optimizations**
- **Security enhancements**
- **Accessibility improvements**
- **Mobile experience**
- **Error handling**

### Medium Priority

- **Additional file types**
- **UI/UX improvements**
- **Internationalization**
- **Advanced features**
- **Documentation**

### Good First Issues

Look for issues labeled:
- `good first issue`
- `help wanted`
- `documentation`
- `enhancement`

## 📞 Getting Help

- **GitHub Discussions** for questions
- **Discord/Slack** for real-time chat (if available)
- **Documentation** in the `docs/` folder
- **Code comments** for implementation details

## 🙏 Recognition

Contributors will be:
- **Listed** in the README
- **Credited** in release notes
- **Invited** to the contributors team (for regular contributors)

Thank you for contributing to ShareFilesCF! 🎉
