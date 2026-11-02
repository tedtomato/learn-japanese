// The es course: built from the same code with its own content pack.
globalThis.__HAJIME_COURSE__ = 'es';
const { latinCourseTests } = await import('./latin-course.mjs');
latinCourseTests('es');
