(function (root) {
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

  function createInteraction() {
    let object = { x: 0, y: 1.5 };
    let cursor = null;
    let held = false;
    let wasPinched = false;
    let offset = { x: 0, y: 0 };

    function update(input) {
      if (!input.present) {
        cursor = null;
        held = false;
        wasPinched = false;
      } else {
        const target = { x: (input.x - 0.5) * 3.2, y: 2.5 - input.y * 2 };
        cursor = cursor
          ? { x: cursor.x + (target.x - cursor.x) * 0.4, y: cursor.y + (target.y - cursor.y) * 0.4 }
          : target;
        if (input.pinched && !wasPinched && Math.hypot(cursor.x - object.x, cursor.y - object.y) < 0.32) {
          held = true;
          offset = { x: object.x - cursor.x, y: object.y - cursor.y };
        } else if (!input.pinched) {
          held = false;
        }
        if (held) object = { x: cursor.x + offset.x, y: cursor.y + offset.y };
        wasPinched = input.pinched;
      }
      return { object: { ...object }, cursor: cursor && { ...cursor }, held };
    }

    return { update };
  }

  if (typeof module !== 'undefined') module.exports = { createInteraction, handState };
  else {
    root.createInteraction = createInteraction;
    root.handState = handState;
  }
})(globalThis);
