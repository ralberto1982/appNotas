import { createRoot } from 'react-dom/client';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import SlashMenu from '../components/Notes/SlashMenu';
import { createRef } from 'react';

export const SLASH_COMMANDS = [
  {
    title: 'Título 1',
    desc: 'Encabezado grande',
    icon: 'H1',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: 'Título 2',
    desc: 'Encabezado mediano',
    icon: 'H2',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: 'Título 3',
    desc: 'Encabezado pequeño',
    icon: 'H3',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: 'Texto normal',
    desc: 'Párrafo sin formato',
    icon: '¶',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: 'Negrita',
    desc: 'Texto en negrita',
    icon: 'B',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBold().run(),
  },
  {
    title: 'Cursiva',
    desc: 'Texto en cursiva',
    icon: 'I',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleItalic().run(),
  },
  {
    title: 'Subrayado',
    desc: 'Texto subrayado',
    icon: 'U',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleUnderline().run(),
  },
  {
    title: 'Lista',
    desc: 'Lista con viñetas',
    icon: '•',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Lista numerada',
    desc: 'Lista con números',
    icon: '1.',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'Cita',
    desc: 'Bloque de cita',
    icon: '"',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: 'Código',
    desc: 'Bloque de código',
    icon: '<>',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCode().run(),
  },
  {
    title: 'Línea divisora',
    desc: 'Separador horizontal',
    icon: '—',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

export const slashSuggestion = {
  items: ({ query }) =>
    SLASH_COMMANDS.filter((c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.desc.toLowerCase().includes(query.toLowerCase())
    ),

  render: () => {
    let component;
    let popup;
    let root;
    const menuRef = createRef();

    return {
      onStart(props) {
        const el = document.createElement('div');
        root = createRoot(el);
        root.render(<SlashMenu ref={menuRef} items={props.items} command={props.command} />);
        component = el;

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: el,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          theme: 'slash',
        });
      },

      onUpdate(props) {
        root.render(<SlashMenu ref={menuRef} items={props.items} command={props.command} />);
        popup[0].setProps({ getReferenceClientRect: props.clientRect });
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        return menuRef.current?.onKeyDown(props) ?? false;
      },

      onExit() {
        popup[0].destroy();
        root.unmount();
      },
    };
  },
};
