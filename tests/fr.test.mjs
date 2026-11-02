// The fr course: built from the same code with its own content pack.
globalThis.__HAJIME_COURSE__ = 'fr';
const { latinCourseTests } = await import('./latin-course.mjs');
latinCourseTests('fr');
