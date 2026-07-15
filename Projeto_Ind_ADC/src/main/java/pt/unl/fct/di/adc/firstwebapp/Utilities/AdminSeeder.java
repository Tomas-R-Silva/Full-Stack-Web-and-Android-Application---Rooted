package pt.unl.fct.di.adc.firstwebapp.Utilities;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import org.apache.commons.codec.digest.DigestUtils;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.StringValue;
import com.google.cloud.datastore.Transaction;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;

import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;

/**
 * Bootstraps the first ADMIN account when the application starts.
 *
 * Credentials come from environment variables set in appengine-web.xml
 * (ROOT_ADMIN_USERNAME / ROOT_ADMIN_EMAIL / ROOT_ADMIN_PASSWORD) — never hardcoded.
 * The account is flagged must_change_password so it can be forced to reset on first
 * login.
 */
public class AdminSeeder implements ServletContextListener {

	private static final Logger Log = Logger.getLogger(AdminSeeder.class.getName());

	private static final Datastore datastore = DatastoreOptions.newBuilder()
			.setProjectId("adc-final")
			.build()
			.getService();

	@Override
	public void contextInitialized(ServletContextEvent sce) {
		try {
			seedRootAdmin();
		} catch (Exception e) {
			Log.severe("Admin seed failed: " + e.getMessage());
		}
	}

	private void seedRootAdmin() {
		String username = envOr("ROOT_ADMIN_USERNAME", "root");
		String email = envOr("ROOT_ADMIN_EMAIL", "admin@rooted.pt");
		String password = System.getenv("ROOT_ADMIN_PASSWORD");

		if (password == null || password.isBlank()) {
			Log.warning("ROOT_ADMIN_PASSWORD not set — skipping admin seed.");
			return;
		}

		Key key = datastore.newKeyFactory().setKind("User").newKey(username);

		// App Engine boots many instances and each runs this, but only
		// one commit can win, so no duplicate/overwrite races.
		Transaction txn = datastore.newTransaction();
		try {
			if (txn.get(key) != null) {
				txn.rollback();
				Log.info("Root admin '" + username + "' already exists — seed skipped.");
				return;
			}

			List<StringValue> displayHistory = new ArrayList<>(1);
			displayHistory.add(StringValue.of(username));

			Entity admin = Entity.newBuilder(key)
					.set("user_name", username)
					.set("user_email", email)
					.set("user_pwd", DigestUtils.sha512Hex(password))
					.set("user_role", Role.ADMIN.name())
					.set("user_display", username)
					.set("old_display", displayHistory)
					.set("user_creation_time", System.currentTimeMillis())
					.set("tokens", new ArrayList<StringValue>())
					.set("category", new ArrayList<StringValue>())
					.set("must_change_password", true)
					.build();

			txn.put(admin);
			txn.commit();
			Log.info("Root admin '" + username + "' created by seed.");

		} catch (Exception e) {
			if (txn.isActive()) txn.rollback();
			Log.warning("Root admin seed not applied (a concurrent instance may have done it): " + e.getMessage());
		}
	}

	private static String envOr(String name, String fallback) {
		String v = System.getenv(name);
		return (v == null || v.isBlank()) ? fallback : v;
	}

	@Override
	public void contextDestroyed(ServletContextEvent sce) { }
}
