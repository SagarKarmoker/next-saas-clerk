'use client'
import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'

// usehooks-ts lib -> best
export default function Dashboard() {
    const { user } = useUser()
    const [todos, setTodos] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [isSubscribed, setIsSubscribed] = useState(false)


    // type to search 
    const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300)

    const fetchTodos = useCallback(async (page) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/todos?page=${page}&search=${debouncedSearchTerm}`)

            if (!response.ok) {
                throw new Error("Failed to fetch todos")
            }
            const data = response.json()
            setTodos(data.todos)
            setTotalPages(data.totolPages)
            setCurrentPage(data.currentPage)
            setLoading(false)
        } catch (error) {
            console.log(error)
        }
    }, [debouncedSearchTerm])

    useEffect(() => {
        fetchTodos(1);
        fetchSubStatus()
    }, [])

    const fetchSubStatus = async () => {
        const response = await fetch(`/api/subscription`)
        if (response.ok) {
            const data = await response.json()
            setIsSubscribed(data.isSubscribed)
        }
    }

    const handleTodo = async () => {
        
    }

    return (
        <div>page</div>
    )
}
