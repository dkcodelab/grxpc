import { grpcStreamToObservable } from './streams';
import { ClientReadableStream } from './__mocks__/grpc-web';
import { Subject, takeUntil } from 'rxjs';
import exp from 'constants';

describe('streams', () => {
  describe('#grpcStreamToObservable', () => {
    let clientStream: ClientReadableStream<string>;
    const terminate$ = new Subject<void>();

    beforeEach(() => {
      clientStream = new ClientReadableStream();
    });

    it('should send correct data on events', (done) => {
      grpcStreamToObservable<string>(clientStream as any)
        .pipe(takeUntil(terminate$))
        .subscribe((event) => {
          switch (event.type) {
            case 'status':
              expect(event.status).toBe('status');
              break;
            case 'metadata':
              expect(event.metadata).toBe('metadata');
              break;
            case 'data':
              expect(event.data).toBe('data');
              done();
              terminate$.next();
              break;
            default:
              break;
          }
        });
      clientStream.send('status', 'status');
      clientStream.send('metadata', 'metadata');
      clientStream.send('data', 'data');
    });

    it('should remove listeners', () => {
      grpcStreamToObservable<string>(clientStream as any)
        .pipe(takeUntil(terminate$))
        .subscribe();

      const removeListenerSpy = jest.spyOn(clientStream, 'removeListener');
      clientStream.send('data', 'data');
      clientStream.send('end');
      expect(removeListenerSpy).toHaveBeenCalled();
      // Should be called 5 times for 'error', 'status', 'metadata', 'data' and 'end'
      expect(removeListenerSpy).toHaveBeenCalledTimes(5);

      terminate$.next();
    });
  });
});
