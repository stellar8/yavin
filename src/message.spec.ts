import { selectPart, extractContent } from './message';
import { MessagePart, Message } from './types';

describe('selectPart', () => {
  it('selects text parts first', () => {
    const parts: MessagePart[] = [
      { mimeType: 'text/html', body: { data: "<p>I'm an HTML part!</p>" } },
      { mimeType: 'text/plain', body: { data: "I'm a text part!" } },
    ];
    expect(selectPart(parts).body?.data).toEqual("I'm a text part!");
  });

  it('skips parts without body data', () => {
    const parts: MessagePart[] = [
      { mimeType: 'text/html', body: { data: "<p>I'm an HTML part!</p>" } },
      { mimeType: 'text/plain', body: {} },
    ];
    expect(selectPart(parts).body?.data).toEqual("<p>I'm an HTML part!</p>");
  });

  it('prefers known types', () => {
    const parts: MessagePart[] = [
      { mimeType: 'non/sense', body: { data: 'fhqwhgads' } },
      { mimeType: 'text/html', body: { data: "<p>I'm an HTML part!</p>" } },
    ];
    expect(selectPart(parts).body?.data).toEqual("<p>I'm an HTML part!</p>");
  });

  it('returns the first part if no known types are present', () => {
    const parts: MessagePart[] = [
      { mimeType: 'non/sense', body: { data: 'fhqwhgads' } },
      { mimeType: 'light/switch', body: { data: 'The Cheat is grounded!' } },
    ];
    expect(selectPart(parts).body?.data).toEqual('fhqwhgads');
  });

  it('recurses into multipart/alternative', () => {
    const parts: MessagePart[] = [
      {
        mimeType: 'multipart/alternative',
        parts: [
          { mimeType: 'text/html', body: { data: "<p>I'm an HTML part!</p>" } },
          { mimeType: 'text/plain', body: { data: "I'm a text part!" } },
        ],
      },
      { mimeType: 'non/sense', body: { data: 'fhqwhgads' } },
    ];
    expect(selectPart(parts).body?.data).toEqual("I'm a text part!");
  });
});

describe('extractContent', () => {
  it('prefers body to parts', () => {
    const message: Message = {
      payload: {
        body: { data: 'SSBzYWlkIGNvbWUgb24sIGZocXdoZ2Fkcw==' },
        parts: [
          { mimeType: 'text/html', body: { data: 'ZXZlcnlib2R5IHRvIHRoZSBsaW1pdA==' } },
          { mimeType: 'text/plain', body: { data: 'ZXZlcnlib2R5LCBjb21lIG9uLCBmaHF3aGdhZHMh' } },
        ],
      },
    };
    expect(extractContent(message)).toEqual('I said come on, fhqwhgads');
  });

  it('uses the first part if no known types are present', () => {
    const message: Message = {
      payload: {
        parts: [
          { mimeType: 'non/sense', body: { data: 'ZXZlcnlib2R5IHRvIHRoZSBsaW1pdA==' } },
          { mimeType: 'the/limit', body: { data: 'ZXZlcnlib2R5LCBjb21lIG9uLCBmaHF3aGdhZHMh' } },
        ],
      },
    };
    expect(extractContent(message)).toEqual('everybody to the limit');
  });

  it('obeys mimetype preference when using parts', () => {
    const message: Message = {
      payload: {
        parts: [
          { mimeType: 'text/html', body: { data: 'ZXZlcnlib2R5IHRvIHRoZSBsaW1pdA==' } },
          { mimeType: 'text/plain', body: { data: 'ZXZlcnlib2R5LCBjb21lIG9uLCBmaHF3aGdhZHMh' } },
        ],
      },
    };
    expect(extractContent(message)).toEqual('everybody, come on, fhqwhgads!');
  });

  it('returns null when no content is available', () => {
    const message: Message = {
      payload: {
        parts: [
          { mimeType: 'text/html', body: {} },
          { mimeType: 'text/plain', body: {} },
        ],
      },
    };
    expect(extractContent(message)).toEqual(null);
  });
});
