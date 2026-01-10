export const formatValidationErrors = (errors) => {

  if(!errors || !errors.issues) return 'Invalid input';
  if (Array.isArray(errors.issues)) {
    return errors.issues.map(issue => {
      const field = issue.path.join('.');
      return `${field}: ${issue.message}`;
    }).join('; ');
  }
  return 'Invalid input';
};