// Importing React hook for managing component state
import { useEffect, useState } from "react"
import { MdClose } from "react-icons/md"
import { useSelector } from "react-redux"

export default function ChipInput({
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)

  const [chips, setChips] = useState([])
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    if (editCourse) {
      setChips(course?.tag || [])
    }
    register(name, { required: true, validate: (value) => value.length > 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setValue(name, chips)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chips])

  const addChip = () => {
    const chipValue = inputValue.trim()
    if (chipValue && !chips.includes(chipValue)) {
      setChips([...chips, chipValue])
      setInputValue("")
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addChip()
    }
  }

  const handleDeleteChip = (chipIndex) => {
    setChips(chips.filter((_, index) => index !== chipIndex))
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>

      {/* Chips always on top */}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, index) => (
          <div
            key={index}
            className="flex items-center rounded-full bg-yellow-400 px-2 py-1 text-sm text-richblack-900"
          >
            {chip}
            <button
              type="button"
              className="ml-2 focus:outline-none"
              onClick={() => handleDeleteChip(index)}
            >
              <MdClose className="text-sm" />
            </button>
          </div>
        ))}
      </div>

      {/* Input always below */}
      <div className="flex items-center gap-2 w-full">
        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="form-style flex-1"
        />
        <button
          type="button"
          onClick={addChip}
          className="rounded-md bg-yellow-400 px-3 py-1 text-sm text-richblack-900"
        >
          Add
        </button>
      </div>

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
