const ART = String.raw`
          *
         ***
    *************      a.v. OS
         ***
          *
`;

/** A note for the people who open DevTools. Printed once per page load. */
export function printConsoleGreeting() {
  console.log(
    `%c${ART}\n%cHi, fellow developer.\nThis site is designed and coded by me, Anastasia: React, Three.js and GLSL for the foil.\nIf you like how it's built, say hello: a.vilmovskaya@gmail.com`,
    "font-family: monospace; color: #8a6cff;",
    "font-family: monospace; font-size: 12px; line-height: 1.5;",
  );
}
