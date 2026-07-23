package pt.unl.fct.di.adc.firstwebapp.Utilities;

import java.io.IOException;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;

/**
 * Adds CORS headers to every response so the browser-based frontend
 * (e.g. http://localhost:5173) is allowed to call this API.
 *
 * The request Origin is reflected back (instead of "*") so that requests
 * carrying credentials/Authorization headers are accepted by the browser.
 */
@Provider
public class CORSFilter implements ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext requestContext,
                       ContainerResponseContext responseContext) throws IOException {

        String origin = requestContext.getHeaderString("Origin");
        if (origin == null) {
            origin = "*";
        }

        responseContext.getHeaders().putSingle("Access-Control-Allow-Origin", origin);
        responseContext.getHeaders().putSingle("Vary", "Origin");
        responseContext.getHeaders().putSingle("Access-Control-Allow-Credentials", "true");
        responseContext.getHeaders().putSingle("Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD");
        responseContext.getHeaders().putSingle("Access-Control-Allow-Headers",
                "Origin, Content-Type, Accept, Authorization");
        responseContext.getHeaders().putSingle("Access-Control-Max-Age", "3600");
    }
}
