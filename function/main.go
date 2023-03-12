package function

import (
	"context"
	"log"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	cloudevents "github.com/cloudevents/sdk-go/v2"
)

func init() {
	functions.CloudEvent("CloudEventFunc", cloudEventFunc)
}

func cloudEventFunc(ctx context.Context, e cloudevents.Event) error {
	log.Print("begin")
	log.Print("end")
	// Do something with event.Context and event.Data (via event.DataAs(foo)).
	return nil
}
