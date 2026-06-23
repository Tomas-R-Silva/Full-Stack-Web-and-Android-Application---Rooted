package pt.unl.fct.di.adc.firstwebapp;

import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;
import pt.unl.fct.di.adc.firstwebapp.Utilities.CORSFilter;
import pt.unl.fct.di.adc.firstwebapp.resources.EventResources;
import pt.unl.fct.di.adc.firstwebapp.resources.ForumResources;
import pt.unl.fct.di.adc.firstwebapp.resources.UserResources;

public class ApplicationConfig extends ResourceConfig {

    public ApplicationConfig() {
        register(MultiPartFeature.class);
        register(CORSFilter.class);
        register(EventResources.class);
        register(ForumResources.class);
        register(UserResources.class);
    }
}
