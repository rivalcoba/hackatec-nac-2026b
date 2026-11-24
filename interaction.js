(function (root) {
  function findRightHand(hands) {
    return hands.find(hand => hand.handedness === 'Right') || null;
  }

  function handState(hand, width, height) {
    const thumb = hand.keypoints[4];
    const index = hand.keypoints[8];
    const clamp = value => Math.max(0, Math.min(1, value));
    return {
      present: true,
      x: clamp((thumb.x + index.x) / 2 / width),
      y: clamp((thumb.y + index.y) / 2 / height),
      pinched: Math.hypot(thumb.x - index.x, thumb.y - index.y) < 40
    };
  }

  function createPointer() {
    let cursor = null;
    let wasPinched = false;

    function update(input) {
      if (!input.present) {
        cursor = null;
        wasPinched = false;
        return { cursor: null, pinched: false, pressed: false };
      }
      const target = { x: (input.x - 0.5) * 3.2, y: 2.5 - input.y * 2 };
      cursor = cursor
        ? { x: cursor.x + (target.x - cursor.x) * 0.4, y: cursor.y + (target.y - cursor.y) * 0.4 }
        : target;
      const pressed = input.pinched && !wasPinched;
      wasPinched = input.pinched;
      return { cursor: { ...cursor }, pinched: input.pinched, pressed };
    }

    return { update };
  }

  function createInteraction() {
    const pointer = createPointer();
    let object = { x: 0, y: 1.5 };
    let held = false;
    let offset = { x: 0, y: 0 };

    function update(input) {
      const { cursor, pinched, pressed } = pointer.update(input);
      if (!cursor) {
        held = false;
      } else {
        if (pressed && Math.hypot(cursor.x - object.x, cursor.y - object.y) < 0.32) {
          held = true;
          offset = { x: object.x - cursor.x, y: object.y - cursor.y };
        } else if (!pinched) {
          held = false;
        }
        if (held) object = { x: cursor.x + offset.x, y: cursor.y + offset.y };
      }
      return { object: { ...object }, cursor, held };
    }

    return { update };
  }

  if (typeof module !== 'undefined') module.exports = { createPointer, createInteraction, findRightHand, handState };
  else {
    root.createPointer = createPointer;
    root.createInteraction = createInteraction;
    root.findRightHand = findRightHand;
    root.handState = handState;
  }
})(globalThis);
