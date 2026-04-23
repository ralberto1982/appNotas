import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const SlashMenu = forwardRef(({ items, command }, ref) => {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === 'ArrowUp') {
        setSelected((s) => (s - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelected((s) => (s + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        command(items[selected]);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) return null;

  return (
    <div className="slash-menu">
      {items.map((item, i) => (
        <button
          key={item.title}
          className={`slash-item ${i === selected ? 'slash-item--active' : ''}`}
          onClick={() => command(item)}
        >
          <span className="slash-item__icon">{item.icon}</span>
          <span className="slash-item__text">
            <span className="slash-item__title">{item.title}</span>
            <span className="slash-item__desc">{item.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
});

SlashMenu.displayName = 'SlashMenu';
export default SlashMenu;
