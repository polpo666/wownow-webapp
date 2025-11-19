import REGEX from './regex';

function validate(uuid: string) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

export default validate;
