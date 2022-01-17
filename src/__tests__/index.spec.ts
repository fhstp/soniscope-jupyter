// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Add any needed widget imports here (or from controls)
// import {} from '@jupyter-widgets/base';

import { createTestModel } from './utils';

import { LensModel } from '..';

describe('LensWidget', () => {
  describe('LensModel', () => {
    it('should be createable', () => {
      const model = createTestModel(LensModel);
      expect(model).toBeInstanceOf(LensModel);
      expect(model.get('x_field')).toEqual('');
    });

    // it('should be createable with a value', () => {
    //   const state = { value: 'foo' };
    //   const model = createTestModel(LensModel, state);
    //   expect(model).toBeInstanceOf(LensModel);
    //   expect(model.get('x_field')).toEqual('foo');
    // });
  });
});
