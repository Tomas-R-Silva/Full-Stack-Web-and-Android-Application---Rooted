package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

public abstract class AbstractInputRequest<E extends ModelInterface> implements ModelInterface{
	/**
	 * {
	 *   "input": E
	 * }
	 */
	
	public AbstractInputRequest() {}

	private E input;

	public E getInput() {
		return input;
	}

	public void setInput(E input) {
		this.input = input;
	}
	
	@SuppressWarnings("deprecation")
	@Override
	public Map<String, Object> getformat() {
		try {
			return Map.of("input",Getinputclass().newInstance().getformat());
		} catch (InstantiationException | IllegalAccessException e1) {
			return Map.of();
		}
	}

}
