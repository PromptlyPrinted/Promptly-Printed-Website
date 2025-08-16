import type { Thing, WithContext } from 'schema-dts';

type JsonLdProps = {
  code: WithContext<Thing>;
};

export const JsonLd = ({ code }: JsonLdProps) => {
  if (!code) {
    return null;
  }
  
  try {
    const jsonString = JSON.stringify(code);
    return (
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: "This is a JSON-LD script, not user-generated content."
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    );
  } catch (error) {
    console.error('Failed to stringify JSON-LD code:', error);
    return null;
  }
};

export * from 'schema-dts';
