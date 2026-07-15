@ -1,83 +0,0 @@
import java.io.File;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class endlocal {
	public endlocal() {}
	private enum AC{START,STARTQUICK,END,BASE;}


	public static void main(String[] args) throws IOException, InterruptedException {
		//Process p;
		//Runtime.getRuntime().
		//Thread.
		AC a=AC.BASE;
		switch(a) {
		case END->{findandkill(8080);findandkill(8081);System.out.println("DONE");}
		case START->{new endlocal.Startdatabase().start();new endlocal.Startprogram().start();}
		case BASE->{new endlocal.Startdatabase().start();}
		case STARTQUICK->{new endlocal.Startdatabase().start();new endlocal.StartprogramQuick().start();}
		}
	}
	private static class StartprogramQuick extends Thread{public StartprogramQuick() {}
	public void run() {try {
		ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/C","mvn","appengine:run");
		pb.directory(new File("C:\\Users\\Artur\\Documents\\Java\\ADC\\ADC-Final\\Projeto_Ind_ADC"));
		Process process = pb.start();
		process.waitFor();
	} catch (IOException e) {e.printStackTrace();} catch (InterruptedException e) {e.printStackTrace();}
	}
	}
	private static class Startprogram extends Thread{public Startprogram() {}
	public void run() {try {//mvn clean package appengine:run
		ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/C","mvn", "clean", "package","appengine:run");
		pb.directory(new File("C:\\Users\\Artur\\Documents\\Java\\ADC\\ADC-Final\\Projeto_Ind_ADC"));
		Process process= pb.start();
		process.waitFor();
	} catch (IOException e) {e.printStackTrace();} catch (InterruptedException e) {e.printStackTrace();}
	}
	}
	private static class Startdatabase extends Thread{public Startdatabase() {}
	public void run() {try {
		ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/C","gcloud","beta", "emulators", "datastore", "start");
		pb.directory(new File("C:\\Users\\Artur\\Documents\\Java\\ADC\\ADC-Final\\Projeto_Ind_ADC"));
		//pb.redirectOutput(new File("C:\\Users\\Artur\\Documents\\Java\\ADC\\ADC-Final\\Projeto_Ind_ADC\\bbbb.txt"));
		//for(String s:pb.command())System.out.println(s);
		Process process = pb.start();
		//for(String s:process.children().map(v-> v.toString()).collect(Collectors.toList()))System.out.println(s);
		process.waitFor();
	} catch (IOException e) {e.printStackTrace();} catch (InterruptedException e) {e.printStackTrace();}
	}}

	private static void findandkill(int port) throws IOException, InterruptedException {
		ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/C", "netstat -ano | findstr :" + port);
		Process process = pb.start();
		process.waitFor();
		String out = "";
		int bytesRead = -1;
		byte[] bytes = new byte[1024];
		while ((bytesRead = process.getInputStream().read(bytes)) > -1) 
			out = out+ new String(bytes, 0, bytesRead);
		Pattern pattern = Pattern.compile("([0-9]{1,5}$)");
		Matcher matcher = pattern.matcher(out);
		while (matcher.find())
			//System.out.println(matcher.group(1));
			killProcess(String.valueOf(matcher.group(1)));
	}

	@SuppressWarnings("deprecation")
	private static void killProcess(String processID) {
		System.out.println("Killing process with ID " + processID + "...");
		String cmd = "taskkill /F /PID " + processID;
		try {
			Runtime.getRuntime().exec(cmd);
			System.out.println("Killed " + processID + "!");
		}
		catch (IOException e) {
			System.out.println("Could not kill process with ID " + processID);
			e.printStackTrace();
		}
	}

}