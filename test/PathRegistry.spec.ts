import { assert } from "chai";
import { resolve } from "path";

import { Messages } from "../lib/classes/Messages";
import { PathRegistry } from "../lib/classes/PathRegistry";

import { MessagesEnum } from "../messages";

describe("class PathRegistry", () => {
  const key = "entity";
  const obj = { [key]: "dir" };

  it("should be created", () => {
    const pr = new PathRegistry({});
    assert.isNotNull(pr);
  });

  it(`should be created with '${key}' record resolved to cwd`, () => {
    const pr = new PathRegistry(obj);
    assert.equal(pr.get(key), resolve(process.cwd(), obj[key]));
  });

  it(`should be able to update existing '${key}' record`, () => {
    const pr = new PathRegistry(obj);
    assert.equal(pr.get(key), resolve(process.cwd(), obj[key]));

    const newPath = `${obj[key]}_new`;
    pr.update({ [key]: newPath });
    assert.equal(pr.get(key), resolve(process.cwd(), newPath));
  });

  it("should be able to return joined path", () => {
    const pr = new PathRegistry(obj);
    assert.equal(pr.join(key, "sub"), `${pr.get(key)}/sub`);
  });

  it("should be rejected with read key error", () => {
    const pr = new PathRegistry(obj);
    const altKey = `${key}_alt`;
    try {
      pr.get(altKey);
    } catch (err) {
      assert.equal(err.message, Messages.text(MessagesEnum.NO_PATH, { key: altKey }));
    }
  });
});
