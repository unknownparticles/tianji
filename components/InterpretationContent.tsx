import React from 'react';

interface InterpretationContentProps {
  content: string;
}

/** 将受控的 Markdown 子集渲染为解读正文，不将文本作为 HTML 执行。 */
const InterpretationContent: React.FC<InterpretationContentProps> = ({ content }) => {
  const renderInline = (text: string) => text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });

  return (
    <div className="ink-interpretation-content">
      {content.split('\n').map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <div key={index} className="h-4" aria-hidden="true" />;

        if (trimmedLine.startsWith('## ')) {
          return <h2 key={index}>{renderInline(trimmedLine.slice(3))}</h2>;
        }
        if (trimmedLine.startsWith('# ')) {
          return <h1 key={index}>{renderInline(trimmedLine.slice(2))}</h1>;
        }
        if (trimmedLine.startsWith('> ')) {
          return <blockquote key={index}>{renderInline(trimmedLine.slice(2))}</blockquote>;
        }
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          return <p key={index} className="ink-interpretation-emphasis">{renderInline(trimmedLine)}</p>;
        }
        return <p key={index}>{renderInline(trimmedLine)}</p>;
      })}
    </div>
  );
};

export default InterpretationContent;
